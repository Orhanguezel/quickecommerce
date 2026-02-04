import CustomLayout from "@/components/layout/CustomLayout";
import EditSlider from "@/components/screen/admin-section/slider/EditSlider";


type Props = {params: Promise<{ id: string }>;};
const EditSliderPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <EditSlider ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditSliderPage;