import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-4">FanHub</h3>
            <p className="text-gray-400">
              打通粉絲在各大平台的身分，建立創作者與粉絲的專屬連結。
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">服務</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/discover" className="text-gray-400 hover:text-white">
                  創作者專頁
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white">
                  多平台綁定
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-gray-400 hover:text-white">
                  簽到系統
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                  數據分析
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">創作者資源</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  創作者指南
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  社群經營
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  數據解讀
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  成功案例
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">關於我們</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  關於 FanHub
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  隱私政策
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  使用條款
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  聯絡我們
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-500 text-center">
          <p>© {new Date().getFullYear()} FanHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
