// hooks/useToast.ts
export function useToast() {
  const showToast = (
    title: string,
    description?: string,
    variant: 'default' | 'success' | 'error' | 'warning' = 'default'
  ) => {
    const event = new CustomEvent('show-toast', {
      detail: { title, description, variant },
    });
    window.dispatchEvent(event);
  };

  return { toast: showToast };
}