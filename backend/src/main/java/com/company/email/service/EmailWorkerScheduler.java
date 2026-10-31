package com.company.email.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EmailWorkerScheduler {

    private final EmailWorkerService emailWorkerService;
    private final EmailTemplateRenderer emailTemplateRenderer;

    public EmailWorkerScheduler(
            EmailWorkerService emailWorkerService,
            EmailTemplateRenderer emailTemplateRenderer) {
        this.emailWorkerService = emailWorkerService;
        this.emailTemplateRenderer = emailTemplateRenderer;
    }

    @Scheduled(fixedDelay = 5000)
    @Scheduled(fixedDelay = 5000)
    public void processPendingJobs() {

        System.out.println("Checking for claimable email jobs...");

        var jobIds = emailWorkerService.getClaimableJobIds();

        for (Long jobId : jobIds) {

            boolean claimed = emailWorkerService.claimEmailJob(jobId);

            if (claimed) {
                System.out.println("Successfully claimed job: " + jobId);

                var jobContent = emailWorkerService.getEmailJobContent(jobId);
                System.out.println("Job content retrieved: " + jobContent);

                var logIds = emailWorkerService.getPendingEmailLogIds(jobId);

                System.out.println("Pending recipient log IDs for job "
                        + jobId + ": " + logIds);

                for (Long logId : logIds) {

                    boolean logClaimed = emailWorkerService.claimEmailLog(logId);

                    if (logClaimed) {
                        System.out.println("Successfully claimed recipient log: " + logId);

                        var recipient = emailWorkerService.getClaimedEmailLog(logId);

                        var renderedSubject = emailTemplateRenderer.renderSubject(
                                jobContent.subject(),
                                recipient.recipientName(),
                                jobContent.recordTitle(),
                                jobContent.recordReference()
                        );

                        var renderedHtml = emailTemplateRenderer.renderHtml(
                                jobContent.bodyHtml(),
                                recipient.recipientName(),
                                jobContent.recordTitle(),
                                jobContent.recordReference()
                        );

                        var renderedText = emailTemplateRenderer.renderText(
                                jobContent.bodyText(),
                                recipient.recipientName(),
                                jobContent.recordTitle(),
                                jobContent.recordReference()
                        );

                        System.out.println("Rendered subject: " + renderedSubject);
                        System.out.println("Rendered HTML: " + renderedHtml);
                        System.out.println("Rendered text: " + renderedText);

                        System.out.println("Recipient details retrieved: " + recipient);

                    } else {
                        System.out.println("Recipient log already claimed: " + logId);
                    }
                }
            } else {
                System.out.println("Job already claimed by another worker: " + jobId);
            }
        }
    }
}