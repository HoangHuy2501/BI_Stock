import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#f4f6f9] px-6">
    <div className="w-full max-w-[520px] rounded-xl border border-[#eaecf0] bg-white px-6 py-8 text-center">
      <p className="text-[34px] font-bold leading-none text-[#101828]">404</p>
      <p className="mt-3 text-[13px] text-[#667085]">This page does not exist.</p>
      <Link
        to="/"
        className="mt-5 inline-flex items-center rounded-lg bg-[#3b7bfa] px-3.5 py-2 text-[12.5px] font-semibold text-white"
      >
        Back to Stock overview
      </Link>
    </div>
  </div>
);

export default NotFound;
