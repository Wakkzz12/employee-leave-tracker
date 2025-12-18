# 📋 Employee Leave Tracker System

An interactive, modern, and comprehensive leave management system built for **AsiaPro Butuan** employees. This README includes expandable sections, quick navigation, and clear setup instructions.

---

## 🧭 Table of Contents

* [Overview](#overview)
* [✨ Features](#features)
* [🔐 Authentication & Security](#authentication--security)
* [👥 Employee Management](#employee-management)
* [📝 Leave Management](#leave-management)
* [📊 Dashboard & Reporting](#dashboard--reporting)
* [🛠 Technology Stack](#technology-stack)
* [📦 Key Packages](#key-packages)
* [⚙️ Installation Guide](#installation-guide)
* [🚀 Run the Application](#run-the-application)
* [📁 Project Structure](#project-structure)
* [🤝 Contributing](#contributing)

---

## 📌 Overview

A powerful leave tracking system designed to simplify and automate leave processing for **AsiaPro Butuan** employees. It features:

* Employee information management
* Leave requests with validation
* Approval workflows
* Dashboards and reporting

---

## ✨ Features

<details>
<summary><strong>Click to expand</strong></summary>

### 🔐 Authentication & Security

* Email-based login restricted to **@asiaprobutuan.com** domain
* CSRF protection for all forms
* Laravel Sanctum for session-based authentication
* Secure routing and validation

### 👥 Employee Management

* Create, Read, Update, Delete (CRUD) operations
* Department & position assignment
* Leave credits per employee
* Employee status tracking (Regular, Contractual, etc.)
* Soft deletes with full restore capability

### 📝 Leave Management

* Supports multiple leave types:

  * Sick, Vacation, Emergency, Maternity, Paternity, Bereavement, Unpaid
* Date conflict and overlap prevention
* Attach supporting documents (PDF/JPG/PNG)
* Approval & rejection workflow

### 📊 Dashboard & Reporting

* Real-time analytics
* Leave usage charts
* Recently updated records
* Deleted employee & leave history recovery

</details>

---

## 🛠 Technology Stack

* **Backend:** Laravel 10+
* **Database:** PostgreSQL
* **Frontend:** JS, CSS Bootstrap
* **API Authentication:** Laravel Sanctum
* **ORM:** Eloquent

---

## 📦 Key Packages

* `laravel/sanctum` – API token authentication
* `nesbot/carbon` – Date parsing & formatting
* SoftDeletes – Laravel restore-friendly deletion

---

## ⚙️ Installation Guide

Follow these steps to install the system on your local machine.

### **1. Clone the repository**

```bash
git clone <repository-url>
cd leave-tracker-system
```

### **2. Install PHP dependencies**

```bash
composer install
```

### **3. Configure Environment File**

```bash
cp .env.example .env
php artisan key:generate
```

Add your database credentials inside **.env**.

### **4. Run Migrations**

```bash
php artisan migrate
```

### **Optional:** Seed dummy data

```bash
php artisan db:seed
```

---

## 🚀 Run the Application

### **Back-end Server**

```bash
php artisan serve
```

### **Front-end (if using Node modules)**

```bash
npm install
npm run dev
```

---

## 📁 Project Structure

```
leave-tracker-system/
├── app/
├── public/
├── resources/
|   ├──js/mdoules
|   ├──css/styles.css
|   ├──images/logo.png
│   ├── views/
├── routes/
│   └── web.php
├── database/
│   ├── migrations/
│   └── seeders/
└── .env
```

---

## 🤝 Contributing

Contributions are welcome! You can:

* Submit feature requests
* Improve documentation
* Open bug reports

---

