import Link from "next/link";
import { CONSTANTS } from "@/lib/constants";

export function DashboardFooter() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {CONSTANTS.APP_NAME}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dashboard Creator
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/help"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Bantuan
            </Link>
            <Link
              href="/contact"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Kontak
            </Link>
            <Link
              href="/privacy"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Privasi
            </Link>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 {CONSTANTS.COMPANY_NAME}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
