import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const BSC_API_KEY = "YOUR_BSCSCAN_API_KEY";
const CONTRACT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // USDT BEP20

async function checkUSDTDeposit(address) {
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${CONTRACT_ADDRESS}&address=${address}&sort=desc&apikey=${BSC_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "1") {
    const tx = data.result.find(tx => tx.to.toLowerCase() === address.toLowerCase());
    return tx ? parseFloat(tx.value) / Math.pow(10, 18) : 0;
  }
  return 0;
}

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [deposit, setDeposit] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);

          const received = await checkUSDTDeposit(data.wallet);
          setDeposit(received);

          if (received > 0) {
            await updateDoc(docRef, {
              earnings: received,
              planActive: true,
              hashPower: received * 100 // 1 USDT = 100 TH/s
            });
          }
        }
      } else {
        navigate("/login");
      }
    });
    return () => unsub();
  }, [navigate]);

  const logout = () => signOut(auth).then(() => navigate("/login"));

  if (!userData) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl mb-4">Dashboard</h2>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>Wallet:</strong> {userData.wallet}</p>
      <p><strong>Hash Power:</strong> {userData.hashPower} TH/s</p>
      <p><strong>Earnings:</strong> ${userData.earnings}</p>
      <p><strong>Deposit:</strong> {deposit} USDT</p>
      <p><strong>Plan Active:</strong> {userData.planActive ? "✅ Yes" : "❌ No"}</p>
      <button onClick={logout} className="mt-4">Logout</button>
    </div>
  );
}
