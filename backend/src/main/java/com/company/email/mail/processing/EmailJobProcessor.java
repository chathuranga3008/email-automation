package com.company.email.mail.processing;

import com.company.email.mail.dto.EmailRecipientLogDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmailJobProcessor {

    private final EmailWorkerService emailWorkerService;
    private final EmailTemplateRenderer emailTemplateRenderer;
    private final EmailSenderService emailSenderService;

    public EmailJobProcessor(
            EmailWorkerService emailWorkerService,
            EmailTemplateRenderer emailTemplateRenderer,
            EmailSenderService emailSenderService) {

        this.emailWorkerService = emailWorkerService;
        this.emailTemplateRenderer = emailTemplateRenderer;
        this.emailSenderService = emailSenderService;
    }

    public void processJob(Long jobId) {

        System.out.println("Worker started processing job: " + jobId);

        // Step 1: Atomically claim the job
        boolean claimed = emailWorkerService.claimEmailJob(jobId);

        if (!claimed) {
            System.out.println("Job could not be claimed: " + jobId);
            return;
        }

        try {
            // Step 2: Recover stale recipient logs
            emailWorkerService.recoverStaleEmailLogs(jobId);

            // Step 3: Retrieve saved job content
            var jobContent =
                    emailWorkerService.getEmailJobContent(jobId);

            // Step 4: Retrieve pending recipient logs
            List<Long> logIds =
                    emailWorkerService.getPendingEmailLogIds(jobId);

            for (Long logId : logIds) {

                try {
                    // Step 5: Atomically claim recipient log
                    boolean logClaimed =
                            emailWorkerService.claimEmailLog(logId);

                    if (!logClaimed) {
                        continue;
                    }

                    // Step 6: Retrieve claimed recipient
                    EmailRecipientLogDTO recipient =
                            emailWorkerService.getClaimedEmailLog(logId);

                    // Step 7: Render personalized email
                    String renderedSubject =
                            emailTemplateRenderer.renderSubject(
                                    jobContent.subject(),
                                    recipient.recipientName(),
                                    jobContent.recordTitle(),
                                    jobContent.recordReference()
                            );

                    String renderedHtml =
                            emailTemplateRenderer.renderHtml(
                                    jobContent.bodyHtml(),
                                    recipient.recipientName(),
                                    jobContent.recordTitle(),
                                    jobContent.recordReference()
                            );

                    String renderedText =
                            emailTemplateRenderer.renderText(
                                    jobContent.bodyText(),
                                    recipient.recipientName(),
                                    jobContent.recordTitle(),
                                    jobContent.recordReference()
                            );

                    // Step 8: Send email through Gmail SMTP
                    emailSenderService.sendEmail(
                            recipient.recipientEmail(),
                            renderedSubject,
                            renderedHtml,
                            renderedText
                    );

                    // Step 9: Record successful delivery
                    emailWorkerService.updateEmailLog(
                            logId,
                            "SENT",
                            false,
                            null,
                            null
                    );

                    System.out.println(
                            "Email successfully sent to "
                                    + recipient.recipientEmail()
                                    + " (Log ID: " + logId + ")"
                    );

                } catch (Exception recipientException) {

                    handleRecipientFailure(
                            logId,
                            recipientException
                    );
                }
            }

        } catch (Exception e) {

            System.err.println(
                    "Error processing job " + jobId + ": "
                            + e.getMessage()
            );

            e.printStackTrace();

        } finally {

            // Step 10: Recalculate job status and counts
            try {
                emailWorkerService.finalizeEmailJob(jobId);

                System.out.println(
                        "Job finalized: " + jobId
                );

            } catch (Exception finalizeException) {

                System.err.println(
                        "Could not finalize job " + jobId + ": "
                                + finalizeException.getMessage()
                );

                finalizeException.printStackTrace();
            }
        }
    }

    private void handleRecipientFailure(
            Long logId,
            Exception exception) {

        try {
            EmailRecipientLogDTO recipient =
                    emailWorkerService.getClaimedEmailLog(logId);

            int attemptCount = recipient.attemptCount();

            boolean retryable = attemptCount < 5;

            LocalDateTime nextRetryAt = null;

            if (retryable) {

                long delayMinutes =
                        (long) Math.pow(2, attemptCount - 1);

                nextRetryAt =
                        LocalDateTime.now().plusMinutes(delayMinutes);
            }

            String errorMessage = exception.getMessage();

            if (errorMessage == null || errorMessage.isBlank()) {
                errorMessage = exception.getClass().getSimpleName();
            }

            // Keep error messages within a reasonable database size.
            if (errorMessage.length() > 2000) {
                errorMessage = errorMessage.substring(0, 2000);
            }

            emailWorkerService.updateEmailLog(
                    logId,
                    "FAILED",
                    retryable,
                    errorMessage,
                    nextRetryAt
            );

            System.err.println(
                    "Email failed for log " + logId
                            + ". Attempt: " + attemptCount
                            + ". Retryable: " + retryable
                            + ". Next retry: " + nextRetryAt
            );

        } catch (Exception updateException) {

            System.err.println(
                    "Could not update failed email log " + logId
                            + ": " + updateException.getMessage()
            );

            updateException.printStackTrace();
        }
    }
}
