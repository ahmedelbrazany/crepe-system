// app/clients/page.tsx
"use client";

import Link from "next/link";

const Page = () => (
  <>
    <h1>اختر الخدمة</h1>
    <div className="selectRouteHome">
      <Link href="/clients/search">
        <button className="custom-button"> البحث عن عميل </button>
      </Link>
      <Link href="/clients/new">
        <button className="custom-button"> اضافة عميل </button>
      </Link>
    </div>
  </>
);

export default Page;
