import { Link } from "wouter";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-800 text-gray-300 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-4">FanHub</h3>
            <p className="text-gray-400">
              {t('footer.description')}
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
            <h4 className="text-white font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/discover" className="text-gray-400 hover:text-white">
                  {t('footer.creatorPages')}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white">
                  {t('footer.platformBinding')}
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-gray-400 hover:text-white">
                  {t('footer.checkinSystem')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                  {t('footer.dataAnalysis')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.creatorResources')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  {t('footer.creatorGuide')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  {t('footer.communityManagement')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  {t('footer.dataInterpretation')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  {t('footer.successStories')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.aboutUs')}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  {t('footer.aboutFanHub')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  {t('footer.privacyPolicy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  {t('footer.termsOfUse')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  {t('footer.contactUs')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-500 text-center">
          <p>© {new Date().getFullYear()} FanHub. {t('common.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
