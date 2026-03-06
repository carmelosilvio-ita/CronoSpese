import { useState, useEffect } from "react";

// Semplificato per usare sonner o il sistema interno in modo più pulito
export function useToast() {
  const [toasts, setToasts] = useState<any[]>([]);

  return {
    toasts,
    toast: (props: any) => {
      console.log("Toast:", props);
    },
    dismiss: (id?: string) => {
      console.log("Dismiss toast", id);
    }
  };
}

export const toast = (props: any) => console.log("Static toast:", props);