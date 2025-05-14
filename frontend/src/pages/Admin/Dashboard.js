import { useLanguage } from "../../components/LanguageContext";
const DashboardPage = () => {
  const { t } = useLanguage();
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        {t.dashboardOverview || 'Dashboard Overview'}
      </h1>
    </>
  );
};

export default DashboardPage;
