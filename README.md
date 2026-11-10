# Debt Management Finance

A simple personal finance app to help you understand your debt, know what to pay this month, track income and investments, and see when you can become debt-free.

---

## Debt Management Is Important for Anyone to Survive

Debt is not only a bank number. It affects your monthly cash, your stress level, and the choices you can make for your family.

If you do not know:

- how much you must pay this month
- how much interest is still left
- when each loan will finally settle

then debt can quietly take more of your income than you realise.

Good debt management helps you:

1. **Survive the month** — set aside the right repayment amount before spending the rest.
2. **Avoid late fees** — see due dates clearly.
3. **Reduce long-term cost** — understand interest and fees, not only the installment.
4. **Plan freedom** — know roughly when you can be debt-free if you keep paying.
5. **Stay balanced** — check if debt is too high compared with your income (DSR).

This app is built to make that journey clearer — with monthly focus, payoff progress, and friendly guides along the way.

---

## What you can do in this app

- **Dashboard** — this month’s money in, debt out, and what needs attention
- **Incomes** — salary, other income, leasing
- **Investments** — balances + monthly contribution (fixed amount or % of income)
- **Assets** — what you bought vs what it is worth by year
- **Debts** — loans, fees, interest, settle dates, and payoff cards

On first open, the app asks for your **name**, **email**, and **date of birth**.

---

## Run locally (simple steps)

You do **not** need to be a developer. Follow these steps one by one.

### 1. Install Node.js

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version
3. Install it with the default options
4. Restart your computer if asked

### 2. Open this project folder

Open the `debt-management` folder on your computer  
(the folder that contains this `README.md` file).

### 3. Open Terminal in that folder

**Mac**

1. Open **Terminal**
2. Type `cd ` (with a space)
3. Drag the project folder into Terminal
4. Press **Enter**

**Windows**

1. Open the project folder in File Explorer
2. Click the address bar, type `cmd`, press **Enter**

### 4. Install the app

Copy and paste this, then press Enter:

```bash
npm install
```

Wait until it finishes.

### 5. Prepare the database

Copy and paste this, then press Enter:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 6. Start the app

Copy and paste this, then press Enter:

```bash
npm run dev
```

Leave this Terminal window open while you use the app.

### 7. Open in your browser

Go to:

[http://localhost:3000](http://localhost:3000)

You should see the welcome screen asking for your name, email, and date of birth.

---

## Everyday use

1. Start with **Dashboard** to see this month.
2. Add your **Incomes**.
3. Add your **Debts** (simple: loan + monthly payment, or advanced: rate + fees).
4. Optionally add **Investments** and **Assets**.
5. Come back to the Dashboard to check what to pay and how your journey looks.

To stop the app later: go back to Terminal and press `Ctrl + C`.

To start again next time:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) again.

---

## If something goes wrong

| Problem | Try this |
| --- | --- |
| `npm` not found | Install Node.js LTS again, then restart Terminal |
| Port already in use | Close other apps using port 3000, or restart your computer |
| Database error | Run `npx prisma migrate deploy` and `npx prisma generate` again |
| Page looks empty / old | Stop the app (`Ctrl + C`), run `npm run dev` again, refresh the browser |

Your data is stored locally in a SQLite file (`prisma/dev.db`). It stays on your computer.

---

## Optional: view / edit data

If you want to look at the raw data tables:

```bash
npm run db:studio
```

Then open the link shown in Terminal.
