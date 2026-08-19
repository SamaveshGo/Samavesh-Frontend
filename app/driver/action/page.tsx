"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ActionPageRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/driver/driving");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
