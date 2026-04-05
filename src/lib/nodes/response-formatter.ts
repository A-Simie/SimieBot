export async function responseFormatterNode(state: any) {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];

  // Logic to annotate output with UI metadata or HITL checkpoints for generative UI components
  // In Phase 3, this is a simple pass-through. 
  // Phase 5 will add real generative UI-related logic.
  
  return { messages: [lastMessage] };
}
