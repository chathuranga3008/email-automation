package com.company.email.mail.processing;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

import java.util.concurrent.RejectedExecutionException;

@Component
public class EmailWorkerScheduler {

    private final EmailWorkerService emailWorkerService;
    private final EmailJobProcessor emailJobProcessor;
    private final ThreadPoolTaskExecutor emailTaskExecutor;

    public EmailWorkerScheduler(
            EmailWorkerService emailWorkerService,
            EmailJobProcessor emailJobProcessor,
            @Qualifier("emailTaskExecutor")
            ThreadPoolTaskExecutor emailTaskExecutor) {

        this.emailWorkerService = emailWorkerService;
        this.emailJobProcessor = emailJobProcessor;
        this.emailTaskExecutor = emailTaskExecutor;
    }

    @Scheduled(fixedDelay = 5000)
    public void processPendingJobs() {

        var jobIds = emailWorkerService.getClaimableJobIds();

        for (Long jobId : jobIds) {

            try {
                emailTaskExecutor.execute(
                        () -> emailJobProcessor.processJob(jobId)
                );

                System.out.println(
                        "Submitted job to executor: " + jobId
                );

            } catch (RejectedExecutionException e) {

                System.out.println(
                        "Executor is full. Job not claimed: " + jobId
                );
            }
        }
    }
}
