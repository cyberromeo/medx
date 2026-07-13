"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1536px] border-t border-gray-300 px-6 py-12 md:px-12">
      <div className="flex flex-col justify-between gap-12 md:flex-row">
        {/* Left Column */}
        <div className="flex max-w-sm flex-col">
          <h2 className="mb-4 text-2xl font-bold tracking-wide text-gray-900">
            MedX
          </h2>
          <p className="font-medium text-gray-500">
            Architecting the future of medical education with cinematic learning
            and world-class content.
          </p>
        </div>

        {/* Right Grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-16">
          {/* Protocol Links */}
          <div className="flex flex-col gap-3">
            <h3 className="mb-2 font-semibold text-gray-900">Platform</h3>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Syllabus
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Live Classes
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Test Series
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              FAQ
            </Link>
          </div>

          {/* Developers Links */}
          <div className="flex flex-col gap-3">
            <h3 className="mb-2 font-semibold text-gray-900">Resources</h3>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Study Material
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Mock Tests
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Previous Papers
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Blog
            </Link>
          </div>

          {/* Community Links */}
          <div className="flex flex-col gap-3">
            <h3 className="mb-2 font-semibold text-gray-900">Community</h3>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Discord
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Twitter (X)
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              Instagram
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 text-sm text-gray-400 sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} MedX Education. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="#" className="transition-colors hover:text-gray-600">
            Terms of Service
          </Link>
          <Link href="#" className="transition-colors hover:text-gray-600">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
