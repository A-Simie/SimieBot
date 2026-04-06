'use client';

import { useEffect } from 'react';
import {
  AccessDeniedInterrupt,
  AsyncAuthorizationInterrupt,
  AuthorizationPendingInterrupt,
  AuthorizationPollingInterrupt,
  AuthorizationRequestExpiredInterrupt,
  TokenVaultInterrupt,
  UserDoesNotHavePushNotificationsInterrupt,
} from '@auth0/ai/interrupts';
import type { Interrupt } from '@langchain/langgraph-sdk';

import { TokenVaultConsent } from '@/components/auth0-ai/TokenVault';
import { PromptUserContainer } from '@/components/auth0-ai/util/prompt-user-container';

interface TokenVaultInterruptHandlerProps {
  interrupt: Interrupt | undefined | null;
  onFinish: () => void;
}

function AsyncAuthorizationPendingCard({
  interrupt,
  onFinish,
}: {
  interrupt: Interrupt;
  onFinish: () => void;
}) {
  const interruptValue = interrupt.value as any;
  const retryAfter = Math.max(
    3,
    AuthorizationPollingInterrupt.isInterrupt(interruptValue)
      ? (interruptValue.retryAfter ?? interruptValue.request?.interval ?? 5)
      : (interruptValue.request?.interval ?? 5),
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onFinish();
    }, retryAfter * 1000);

    return () => window.clearTimeout(timeout);
  }, [onFinish, retryAfter, interrupt.ns]);

  return (
      <PromptUserContainer
        title="Approval Pending"
        description={`Check your Auth0 Guardian push notification. SimieBot will retry in about ${retryAfter} seconds if you approve the request.`}
        action={{ label: 'Retry now', onClick: onFinish }}
        containerClassName="border-[#dbe7ff] bg-white text-[#1a1c1c] shadow-sm"
      />
  );
}

export function TokenVaultInterruptHandler({ interrupt, onFinish }: TokenVaultInterruptHandlerProps) {
  if (!interrupt) {
    return null;
  }

  if (TokenVaultInterrupt.isInterrupt(interrupt.value)) {
    return (
      <div key={interrupt.ns?.join('')} className="whitespace-pre-wrap">
        <TokenVaultConsent
          mode="popup"
          interrupt={interrupt.value}
          onFinish={onFinish}
          connectWidget={{
            title: 'Authorization Required.',
            description: interrupt.value.message,
            action: { label: 'Authorize' },
          }}
        />
      </div>
    );
  }

  if (
    AuthorizationPendingInterrupt.isInterrupt(interrupt.value) ||
    AuthorizationPollingInterrupt.isInterrupt(interrupt.value)
  ) {
    return (
      <div key={interrupt.ns?.join('')} className="whitespace-pre-wrap">
        <AsyncAuthorizationPendingCard interrupt={interrupt} onFinish={onFinish} />
      </div>
    );
  }

  if (AccessDeniedInterrupt.isInterrupt(interrupt.value)) {
    return (
      <PromptUserContainer
        title="Approval Denied"
        description="The action was rejected in the approval app, so SimieBot did not continue."
        readOnly
        containerClassName="border-red-200 bg-red-50 text-[#1a1c1c]"
      />
    );
  }

  if (AuthorizationRequestExpiredInterrupt.isInterrupt(interrupt.value)) {
    return (
      <PromptUserContainer
        title="Approval Expired"
        description="The approval request expired before it was approved. Ask SimieBot to try again when you are ready."
        readOnly
        containerClassName="border-amber-200 bg-amber-50 text-[#1a1c1c]"
      />
    );
  }

  if (UserDoesNotHavePushNotificationsInterrupt.isInterrupt(interrupt.value)) {
    return (
      <PromptUserContainer
        title="Guardian Push Needed"
        description="This user is not enrolled in Auth0 Guardian push notifications yet, so async approval cannot start."
        readOnly
        containerClassName="border-amber-200 bg-amber-50 text-[#1a1c1c]"
      />
    );
  }

  if (AsyncAuthorizationInterrupt.isInterrupt(interrupt.value)) {
    return (
      <PromptUserContainer
        title="Approval Required"
        description={interrupt.value.message}
        readOnly
        containerClassName="border-[#dbe7ff] bg-white text-[#1a1c1c] shadow-sm"
      />
    );
  }

  return (
    null
  );
}
