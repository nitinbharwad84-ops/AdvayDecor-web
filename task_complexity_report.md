# 📈 AdvayDecor: Task Complexity & Implementation Report

This document outlines the remaining technical improvements for the AdvayDecor e-commerce platform, ordered from **lowest to highest technical complexity**.

---

## 📊 Complexity Comparison Table

| Rank | Task | Complexity | Effort | Impact | Definition |
| :--- | :--- | :--- | :--- | :--- | :--- |

| **1** | **Cache Products API** | **Low** | 30 min | 🟡 Med | Adding Cache-Control or ISR so the product list loads instantly by using a "remembered" copy instead of hitting the DB every time. |
| **2** | **Global Error Pages** | **Low** | 30 min | 🟡 Med | Creating `error.tsx` and `not-found.tsx` so users see a beautiful branded page if something breaks. |
| **3** | **Stock Validation** | **Medium** | 1 hr | 🔴 High | Verifying stock availability at the exact second the "Pay" button is clicked to prevent "Overselling." |
| **4** | **PWA Support** | **Medium** | 1 hr | 🟢 Low | Adding a web manifest and service worker so customers can "Install" the site on their phone home-screen like a mobile app. |
| **5** | **Product Search** | **Medium** | 2 hrs | 🟡 Med | Implementing a text-based search (e.g., searching "Velvet") using Supabase's `ilike` or Full-Text Search. |
| **6** | **API Rate Limiting** | **Medium** | 2 hrs | 🔴 High | Security layer that blocks bots from spamming your "Send OTP" or "Review" endpoints 100 times a second. |
| **7** | **Razorpay Webhooks** | **High** | 3 hrs | 🟡 Med | Allowing Razorpay to talk directly to your server to confirm payment, even if the customer closes their tab during checkout. |

---

## 🎯 Implementation Strategy

### 1. The "Value Boosters" (Recommended First)
I recommend starting with **Tasks 1, 2, 4, and 6**.
*   **Total Time:** ~1.5 hours.
*   **Result:** The site becomes 50% faster for users and much safer for the business (stock integrity).

### 2. The "Security Hardening"
Once the site is fast, we should move to **Tasks 3 and 9**.
*   **Result:** The database is protected from heavy load, and the APIs are shielded from "Script Kiddies" or bot attacks.

### 3. The "Premium Features"
Lastly, we tackle **Tasks 7, 8, and 10** to give the site that elite, industry-leading feel.

---
**Project:** AdvayDecor-web  
**Report Date:** March 2, 2026
