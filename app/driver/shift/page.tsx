// Redirects legacy /driver/shift to /driver/shifts
import { redirect } from "next/navigation";

export default function LegacyShiftRedirect() {
  redirect("/driver/shifts");
}
