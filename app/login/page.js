"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('clicked')
    // We send the password to a small API we'll make next
    const res = await fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/"); // Success! Go to dashboard
      router.refresh(); 
    } else {
      alert("Wrong password, try again.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleLogin} style={{ background: 'var(--surface)', padding: 40, borderRadius: 12, border: '1px solid var(--border)' }}>
        <h1 style={{ marginBottom: 20, fontSize: 20 }}>Farda Flow Login</h1>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', width: '100%' }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>
          Enter
        </button>
      </form>
    </div>
  );
}