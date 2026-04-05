"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const isFlights = pathname === "/flights";

  if (isFlights) return null;

  return <Navbar />;
}
