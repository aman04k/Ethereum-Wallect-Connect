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
  supportedChainIds: [1, 3, 4, 5, 42], // Ethereum Mainnet and testnets
});

// WalletConnect Connector configuration
const walletConnect = new WalletConnectConnector({
  rpc: {
    1: "https://mainnet.infura.io/v3/086161f5f17e4e5b87ff17b84f2e6a0c", // Replace with your Infura Project ID
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  logging: true, // Enable debug logs
});

const ConnectWallet = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to fetch Ethereum wallet balance
  const fetchBalance = async (address) => {
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await web3Provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance); // Convert from wei to ether
      setWalletBalance(formattedBalance);
    } catch (err) {
      console.error("Failed to fetch wallet balance:", err);
    }
  };

  // Function to fetch Solana wallet balance
  const fetchSolanaBalance = async (address) => {
    try {
      const connection = new Connection("https://api.mainnet-beta.solana.com");
      const balance = await connection.getBalance(new PublicKey(address));
      setWalletBalance((balance / 1e9).toFixed(4)); // Convert lamports to SOL
    } catch (err) {
      console.error("Failed to fetch Phantom Wallet balance:", err);
      setError("Error fetching Phantom Wallet balance.");
    }
  };

  // Function to connect MetaMask
  const connectMetaMask = async () => {
    setLoading(true);
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        const wallet = accounts[0];
        setWalletAddress(wallet);
        fetchBalance(wallet); // Fetch balance after connecting
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

  // Function to connect Trust Wallet
  const connectTrustWallet = async () => {
    setLoading(true);
    try {
      if (window.ethereum) {
        const isTrustWallet =
          window.ethereum.isTrust ||
          (window.ethereum.providers?.some((provider) => provider.isTrust));
        if (!isTrustWallet) {
          throw new Error("Trust Wallet not detected. Please ensure it is installed.");
        }

        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        const wallet = accounts[0];
        setWalletAddress(wallet);
        fetchBalance(wallet); // Fetch balance after connecting
        setError(null);
        setShowModal(false); // Close modal
        alert("Connected to Trust Wallet");
      } else {
        throw new Error(
          "Ethereum provider not detected. Please install a wallet extension like Trust Wallet."
        );
      }
    } catch (err) {
      setError(`Failed to connect to Trust Wallet: ${err.message}`);
      console.error("Trust Wallet connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to connect Coinbase Wallet
  const connectCoinbaseWallet = async () => {
    setLoading(true);
    try {
      if (window.ethereum) {
        const isCoinbaseWallet =
          window.ethereum.isCoinbaseWallet ||
          (window.ethereum.providers?.some((provider) => provider.isCoinbaseWallet));
        if (!isCoinbaseWallet) {
          throw new Error("Coinbase Wallet not detected. Please ensure it is installed.");
        }

        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        const wallet = accounts[0];
        setWalletAddress(wallet);
        fetchBalance(wallet); // Fetch balance after connecting
        setError(null);
        setShowModal(false); // Close modal
        alert("Connected to Coinbase Wallet");
      } else {
        throw new Error(
          "Ethereum provider not detected. Please install a wallet extension like Coinbase Wallet."
        );
      }
    } catch (err) {
      setError(`Failed to connect to Coinbase Wallet: ${err.message}`);
      console.error("Coinbase Wallet connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to connect Phantom Wallet
 // Updated Phantom Wallet Connection Function
const connectPhantomWallet = async () => {
  setLoading(true);
  try {
    const solana = window.solana;
    if (solana && solana.isPhantom) {
      const response = await solana.connect();
      const wallet = response.publicKey.toString();
      setWalletAddress(wallet);

      // Fetch Ethereum-compatible balance for the wallet
      fetchBalance(wallet); // Using fetchBalance from Ethereum provider
      setError(null);
      setShowModal(false); // Close modal
      alert("Connected to Phantom Wallet");
    } else {
      throw new Error("Phantom Wallet not detected. Please install Phantom Wallet.");
    }
  } catch (err) {
    setError(`Failed to connect to Phantom Wallet: ${err.message}`);
    console.error("Phantom Wallet connection error:", err);
  } finally {
    setLoading(false);
  }
};


  // Function to disconnect the wallet
  const disconnectWallet = () => {
    setWalletAddress(null); // Clear wallet address
    setWalletBalance(null); // Clear wallet balance
    setError(null); // Clear error messages
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
            <button
              onClick={connectTrustWallet}
              style={{
                padding: "10px 20px",
                margin: "10px 0",
                background: "#3b99fc",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Trust Wallet
            </button>
            <button
              onClick={connectCoinbaseWallet}
              style={{
                padding: "10px 20px",
                margin: "10px 0",
                background: "#2a67f0",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Coinbase Wallet
            </button>
            <button
              onClick={connectPhantomWallet}
              style={{
                padding: "10px 20px",
                margin: "10px 0",
                background: "#8c54ff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Phantom Wallet
            </button>
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

export default ConnectWallet;
