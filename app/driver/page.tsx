"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DriverRootRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/driver/home");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
