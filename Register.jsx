import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async (e) => {
    e.preventDefault();
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      email,
      wallet,
      hashPower: 0,
      earnings: 0,
      planActive: false
    });
    alert("Registered!");
  };

  return (
    <form onSubmit={registerUser} className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl mb-4">Register</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="mb-2 w-full" />
      <input placeholder="Wallet Address" value={wallet} onChange={e => setWallet(e.target.value)} className="mb-2 w-full" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="mb-4 w-full" />
      <button type="submit" className="w-full">Register</button>
    </form>
  );
}
