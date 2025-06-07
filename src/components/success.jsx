import Swal from "sweetalert2";
export const successNotification = (msg) => {
    Swal.fire({
        position: "center",
        icon: "success",
        title: msg,
        showConfirmButton: true,
        timer: 3000,
        customClass: {
            title: "successClass",
        }

    });
}