import { siteConfig } from "@/lib/site";

export default function AboutPage() {
  return (
    <div className="space-y-3 rounded-2xl border border-orange-100 bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-semibold text-zinc-900">আমাদের কথা</h1>
      <p className="text-zinc-700">
        {siteConfig.name} বানানো হয়েছে {siteConfig.district} জেলার মানুষ যেন দ্রুত জানতে পারে কোন পাম্পে এখন তেল পাওয়া যাচ্ছে, আর কোনটায় স্টক শেষ।
      </p>
      <p className="text-zinc-700">
        এই সাইট পুরোপুরি কমিউনিটি রিপোর্টের উপর চলে। তাই ভোট দেওয়ার আগে নিজের দেখা তথ্য মিলিয়ে দিন, যাতে অন্যরা ভুল পথে না যায়।
      </p>
      <ul className="list-disc space-y-1 pl-5 text-zinc-700">
        <li>শুধু যাচাই করা তথ্য দিন।</li>
        <li>একই স্টেশনে ভুয়া বা বিভ্রান্তিকর ভোট দেবেন না।</li>
        <li>লোকেশন যোগ করলে পাম্পের আসল গেটের কাছে পিন বসান।</li>
      </ul>
      <p className="text-zinc-700">
        নতুন কোনো ফিচার, ভুল তথ্য, বা উন্নতির আইডিয়া থাকলে জানাতে পারেন। ধীরে ধীরে এই সাইট আরও কাজে লাগার মতো করে তোলা হবে।
      </p>
      <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
        <h2 className="text-lg font-semibold text-zinc-900">যোগাযোগ</h2>
        <p className="mt-2 text-zinc-700">
          <span className="font-medium">নাম:</span> {siteConfig.supportName}
        </p>
        <p className="text-zinc-700">
          <span className="font-medium">Email:</span>{" "}
          <a className="text-orange-700 underline hover:text-orange-800" href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>
        </p>
        <p className="text-zinc-700">
          <span className="font-medium">Facebook:</span>{" "}
          <a className="text-orange-700 underline hover:text-orange-800" href={siteConfig.supportFacebook} target="_blank" rel="noreferrer">
            facebook.com/rahimbadsa723
          </a>
        </p>
      </div>
    </div>
  );
}
