import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button
} from "@/components/ui";
import { AlertTriangle } from "lucide-react";
interface Option {
  openDialog: any;
  setOpenDialog: any;
}
const AlertModal = ({ openDialog, setOpenDialog }: Option) => {
  return (
    <>
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 text-2xl font-bold flex flex-col items-center justify-center">
              <AlertTriangle width={32} height={32} />
              Warning Alert
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-white text-md text-center ">
              Either <b >Subscription</b> or{" "}
              <b >Commission</b> must be true.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="app-button"
              onClick={() => setOpenDialog(false)}
            >
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AlertModal;
