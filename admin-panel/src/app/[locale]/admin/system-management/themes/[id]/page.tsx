import ThemeDetails from "@/components/screen/admin-section/system-management/theme/ThemeDetails";

type Props = { params: Promise<{ id: string }> };
const ThemeDetailsPage = async ({ params }: Props) => {
  const param = await params;

  return (
    <>
      <ThemeDetails ID={param.id} />
    </>
  );
};

export default ThemeDetailsPage;
