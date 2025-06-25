// app/_components/WindowControls.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function WindowControls() {
  const minimizeApp = () => {
    window?.electron?.minimizeApp?.();
  };

  const maximizeApp = () => {
    window?.electron?.maximizeApp?.();
  };

  const closeApp = () => {
    window?.electron?.closeApp?.();
  };

  return (
    <div className="flex gap-1">
      <Button
        size="icon"
        variant="secondary"
        onClick={minimizeApp}
        className="rounded-full hover:bg-muted"
      >
        <Image
          src="/images/minimize-icon.png"
          alt="Minimize"
          width={75}
          height={75}
        />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={maximizeApp}
        className="rounded-full hover:bg-muted"
      >
        <Image
          src="/images/maximize-icon.png"
          alt="Maximize"
          width={75}
          height={75}
        />
      </Button>
      <Button
        size="icon"
        variant="destructive"
        onClick={closeApp}
        className="rounded-full hover:bg-red-500"
      >
        <Image
          src="/images/close-icon.png"
          alt="Close"
          width={75}
          height={75}
        />
      </Button>
    </div>
  );
}
