"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Home from "../page";

export default function HomeGate() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!auth) {
      setChecked(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        // unauthenticated → landing
        setChecked(true);
        return;
      }
      if (db) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        const data = snap.data() as any;
        if (!snap.exists() || !data?.onboardingCompleted) {
          router.push("/onboarding");
          return;
        }
      }
      setChecked(true);
    });
    return () => unsub();
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-slate-600 dark:text-slate-300">Loading…</p>
      </div>
    );
  }

  // When checked, show the same landing/home content (personalization happens within app components)
  return <Home />;
}


