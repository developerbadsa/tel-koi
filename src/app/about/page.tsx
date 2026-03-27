export default function AboutPage() {
  return (
    <div className="space-y-3 rounded-2xl border border-orange-100 bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-semibold text-zinc-900">হামার কথা</h1>
      <p className="text-zinc-700">
        মুই লালমনিরহাটের মানুষ। কোন পাম্পে পেট্রোল/ডিজেল পাওয়া যাচ্ছে এইটা মানুষে মানুষে দ্রুত জানবার জন্নে এই সাইটডা বানাইছং।
      </p>
      <p className="text-zinc-700">
       মোর ইচ্ছা একটাই, এলাকার সগায় যেন তেলের ঠিক খবর পাই। তাই এইহানে যেই ভোট দাও, খাটি খবর দিও, গুজব দিয়ো না।
      </p>
      <ul className="list-disc space-y-1 pl-5 text-zinc-700">
        <li> সত্যি খবর মিলায়া তারপর খবর দেন।</li>
        <li>ভোট দিবার সময় মিছামিছি চাপ দিও না।</li>
        <li>সগাইরে সম্মান কইরা কথা কও।</li>
      </ul>
      <p className="text-zinc-700">
        তোমার যদি নতুন আইডিয়া থাকে, বা কুন ভুল দেখো, হেইডা জানাইও। সগাই মিলে সাইটডা আরো ভাল করি তোলমো
      </p>
      <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
        <h2 className="text-lg font-semibold text-zinc-900">যোগাযোগ</h2>
        <p className="mt-2 text-zinc-700">
          <span className="font-medium">নাম:</span> Rahim Badsa
        </p>
        <p className="text-zinc-700">
          <span className="font-medium">Email:</span>{" "}
          <a className="text-orange-700 underline hover:text-orange-800" href="mailto:rahimbadsa723@gmail.com">
            rahimbadsa723@gmail.com
          </a>
        </p>
        <p className="text-zinc-700">
          <span className="font-medium">Facebook:</span>{" "}
          <a
            className="text-orange-700 underline hover:text-orange-800"
            href="https://www.facebook.com/rahimbadsa723"
            target="_blank"
            rel="noreferrer"
          >
            facebook.com/rahimbadsa723
          </a>
        </p>
      </div>
    </div>
  );
}
