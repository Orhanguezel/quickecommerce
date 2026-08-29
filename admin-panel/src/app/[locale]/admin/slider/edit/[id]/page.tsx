import EditSlider from "@/components/screen/admin-section/slider/EditSlider";


type Props = {params: Promise<{ id: string }>;};
const EditSliderPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <EditSlider ID={param.id} />
    </>
  );
};

export default EditSliderPage;