import React, { useState } from "react";
import { ethers } from "ethers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { Connection, PublicKey } from "@solana/web3.js";
import { Buffer, process } from "buffer";

// Polyfill Buffer globally (required for WalletConnect)
window.Buffer = Buffer;
window.global = window;
window.process = process;

// Injected Connector for MetaMask, Coinbase Wallet, and Trust Wallet
const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42] // You can include testnets here if needed
});

// WalletConnect Connector configuration for testnet (Rinkeby)
const walletConnect = new WalletConnectConnector({
  rpc: {
    4: "https://rinkeby.infura.io/v3/086161f5f17e4e5b87ff17b84f2e6a0c", // Rinkeby Testnet
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  logging: true, // Enable debug logs
});

// ConnectWallet component
const Wallet = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch Ethereum wallet balance (Testnet)
  const fetchBalance = async (address) => {
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await web3Provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      setWalletBalance(formattedBalance);
    } catch (err) {
      console.error("Failed to fetch wallet balance:", err);
    }
  };

  // Fetch Solana wallet balance (Testnet)
  const fetchSolanaBalance = async (address) => {
    try {
      const connection = new Connection("https://api.testnet.solana.com"); // Solana Testnet
      const balance = await connection.getBalance(new PublicKey(address));
      setWalletBalance((balance / 1e9).toFixed(4));
    } catch (err) {
      console.error("Failed to fetch Phantom Wallet balance:", err);
      setError("Error fetching Phantom Wallet balance.");
    }
  };

  // Function to connect MetaMask (Testnet)
  const connectMetaMask = async () => {
    setLoading(true);
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        const wallet = accounts[0];
        setWalletAddress(wallet);
        fetchBalance(wallet);
        setError(null);
        setShowModal(false); // Close modal
        alert("Connected to MetaMask");
      } else {
        setError("MetaMask not detected. Please install MetaMask.");
      }
    } catch (err) {
      setError("Failed to connect to MetaMask.");
      console.error("MetaMask connection error:", err);
    } finally {
      setLoading(false);
    }
    
  };

  // Function to disconnect from the wallet
  const disconnectWallet = async () => {
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        // For MetaMask, you can just reset the state to effectively "disconnect"
        setWalletAddress(null);
        setWalletBalance(null);
        alert("Disconnected from MetaMask");
      } else {
        setError("No wallet detected.");
      }
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
      setError("Error disconnecting wallet.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Connect to Wallet</h1>
      {!walletAddress ? (
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: "#2081e2",
            color: "#fff",
            border: "none",
          }}
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div>
          <p>
            <strong>Connected Wallet:</strong> {walletAddress}
          </p>
          <p>
            <strong>Balance:</strong> {walletBalance} {walletAddress.startsWith("0x") ? "ETH" : "SOL"}
          </p>
          <button
            onClick={disconnectWallet}
            style={{
              padding: "10px 20px",
              marginTop: "20px",
              background: "red",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Disconnect Wallet
          </button>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Modal for Wallet Options */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <h2>Connect to Wallet</h2>
            <button
              onClick={connectMetaMask}
              style={{
                padding: "10px 20px",
                margin: "10px 0",
                background: "#f6851b",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              MetaMask
            </button>
            {/* Other wallet connection buttons */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: "10px 20px",
                marginTop: "20px",
                background: "red",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
