# Solana Advanced NFT Dashboard (S.A.N.D)

This is a sophisticated, single-page dashboard to mint and manage compressed NFTs (cNFTs) on the Solana blockchain. Built with React and TypeScript, it features a modern build process using `esbuild`.

## Features

- **Unified Dashboard:** All features on a single, clean interface.
- **Wallet Connection:** Connects to popular Solana wallets (Phantom, Solflare) via Wallet-Adapter.
- **RPC Configuration:** Connect to Devnet, Mainnet, or a custom RPC endpoint. Includes a Devnet SOL airdrop button for easy testing.
- **Merkle Tree Management:** Create a new Merkle Tree with configurable depth, buffer size, and canopy depth.
- **NFT Minter & Metadata Constructer:**
  - A full-featured metadata builder: set the name, symbol, description, image URL, website, royalties, and creators.
  - A secure, two-step process that lets you generate, review, and copy your metadata JSON before minting.
- **Compressed NFT (cNFT) Minting:**
  - Mint cNFTs to your created tree.
  - Optionally associate cNFTs with a Parent/Collection NFT.
  - Supports both creating new metadata on-the-fly or using an existing metadata URL.
- **Persistent Session:** Save your entire session (RPC URL, Tree Address, Mint History) to a local JSON file and load it back later to resume your work.
- **Live Activity Log:** View all your minting transactions in a clean, organized table with direct links to the Solana Explorer.

## Technology Stack

- **React 19**
- **TypeScript**
- **esbuild** for fast bundling and development.
- **Solana Wallet Adapter** for wallet integration.
- **Metaplex UMI (Umi)** for all blockchain interactions (Tree/NFT/cNFT creation).
- **Tailwind CSS** for styling (via CDN).

## Local Setup

This project uses a standard Node.js-based build process.

1.  **Clone the Repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-folder>
    ```

2.  **Install Dependencies:**
    You need Node.js (v20 is recommended) and npm installed.
    ```bash
    npm install
    ```

3.  **Run the Build:**
    This command transpiles the TypeScript/JSX and bundles everything into the `dist` folder.
    ```bash
    npm run build
    ```

4.  **Run the Local Server:**
    This command serves the built application from the `dist` folder.
    ```bash
    npm run start
    ```
    This will start a local server, typically at `http://localhost:3000`.

5.  **Open in Browser:**
    Open your web browser and navigate to the local server address. The application should now be running.

---

## Deployment to Netlify (from GitHub)

Deploying to Netlify is the recommended approach.

> **IMPORTANT: RENAME CONFIGURATION FILES**
> This repository contains mock configuration files for compatibility. Before you deploy, you **must rename** them in your project's root directory:
> 1. Rename `nvmrc.txt` to `.nvmrc`
> 2. Rename `netlify.toml.txt` to `netlify.toml`
>
> These files are critical for a successful build on Netlify.

### Step 1: Create a GitHub Repository

First, you need to get your project code into a GitHub repository.

1.  **Go to GitHub** and create a new, empty repository. Do **not** initialize it with a README or any other files.
2.  **In your local project folder**, initialize a git repository and push your code to GitHub. Replace `<your-github-repo-url>` with the URL of the repository you just created.

    ```bash
    # Make sure you are in the root directory of your project
    git init -b main
    git add .
    git commit -m "Initial commit"
    git remote add origin <your-github-repo-url>
    git push -u origin main
    ```
    Your code is now on GitHub.

### Step 2: Deploy on Netlify

1.  **Sign up or Log in** to your [Netlify](https://www.netlify.com/) account.

2.  From your dashboard, click **"Add new site"** and select **"Import an existing project"**.

3.  **Connect to GitHub** and authorize Netlify to access your repositories.

4.  **Select the repository** you just created from the list.

5.  **Build Settings are Automatic:** The project includes a `netlify.toml` file that automatically configures Netlify with the correct settings (`npm install && npm run build` and the `dist` publish directory). You shouldn't need to change anything.

6.  **Click "Deploy site"**. Netlify will install dependencies, run the build script, and deploy your site from the `dist` folder. You will receive a public URL (like `your-cool-site-name.netlify.app`) once it's complete.

## Disclaimer

**IMPORTANT: Please Read Carefully Before Use**

This software is a powerful tool provided free of charge and "as is", without any warranty of any kind, express or implied. By using this application, you acknowledge and agree to the following terms and assume all associated risks:

**1. Assumption of Risk & No Liability:**
You are solely responsible for your actions. The creator(s) of this application shall not be held liable for any damages, claims, or losses of any kind, including but not limited to: direct, indirect, incidental, or consequential damages, loss of funds, loss of access to assets, or loss of data arising from the use or misuse of this software.

**2. Irreversibility of Blockchain Transactions:**
All transactions initiated through this tool are permanent and irreversible. Once a transaction is confirmed on the Solana blockchain, it cannot be undone, reversed, or altered. Double-check all inputs, addresses, and settings before confirming any action.

**3. Financial Outcomes & Volatility:**
This tool facilitates the creation of digital assets (NFTs/cNFTs) which may or may not have value. The market for digital assets is highly volatile. While you may create something of value, there is no guarantee of any positive financial outcome. You could also incur costs (transaction fees) with no financial return. This tool does not provide financial, investment, or legal advice.

**4. Security is Your Responsibility:**
- **Private Keys:** Never share your private keys or seed phrase. This application interacts with your wallet but does not store your keys. Your wallet's security is paramount.
- **Phishing & Scams:** Be vigilant against phishing attempts. Only use this application from trusted sources.

**5. Software Integrity & Bugs:**
This software interacts with complex smart contracts on the Solana blockchain. While it is built upon established libraries (Metaplex), the application itself may contain bugs, errors, or vulnerabilities that could lead to unexpected outcomes or loss of funds. Use at your own discretion.

**6. Costs & Fees:**
All on-chain actions (creating trees, minting NFTs, etc.) require transaction fees (SOL) to pay for network computation and rent. These fees are your responsibility and are not controlled by this application. Airdrops on Devnet are for testing purposes only and have no real-world value.

**By clicking "Verify & Connect" or initiating any transaction, you confirm that you have read, understood, and accepted this disclaimer in its entirety.**