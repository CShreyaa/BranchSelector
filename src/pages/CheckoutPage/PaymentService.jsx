import { toast } from "react-toastify";
import { getCurrentUserInfo } from "../../services/userService";

const verifyPayment = async (
  userDetails,
  planDetails,
  appointmentDetails,
  paymentDetails,

  ) => {

    console.log(JSON.stringify({
            'userDetails':userDetails,
            'planDetails':planDetails,
            'appointmentDetails':appointmentDetails,
            'paymentDetails':paymentDetails
          }))
    const toastId = toast.loading("Verifying payment...", {
      autoClose: false,
      draggable: true,
    });

    try {
      const response = await fetch(
        "https://verify-credit-purchase.branchselector.workers.dev/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            'userDetails':userDetails,
            'planDetails':planDetails,
            'appointmentDetails':appointmentDetails,
            'paymentDetails':paymentDetails
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        toast.update(toastId, {
          render: `Payment verified successfully! ${planDetails.credits} credits have been added to your account!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
          draggable: true,
        });
      } else {
        toast.update(toastId, {
          render: data.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.update(toastId, {
        render: "Error verifying payment.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        draggable: true,
      });
    }
  };

  const handlePayment = async (plan,appointmentDetails,paymentDetails) => {

    const toastId = toast.loading("Contacting Payment Gateway...", {
      autoClose: false,
      draggable: true,
    });

    try {
      const userDetails = await getCurrentUserInfo();

      const response = await fetch(
        "https://payment-gateway.branchselector.workers.dev/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentDetails: paymentDetails,
            plan:plan
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        toast.update(toastId, {
          render: "Redirected to payment gateway successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          draggable: true,
        });

        const options = {
          key_id: "rzp_test_yAtiwPxT3TKKr2", // Enter the Key ID generated from the Dashboard
          amount: paymentDetails.amount * 100, // Amount in lowest denomination
          currency: paymentDetails.currency,
          name: "SurePass Academy",
          description: plan.title,
          order_id: data.razorpayOrder.id, // Razorpay Order ID
          handler: function (response) {
            
            let tempUserDetails = {"uid":userDetails.uid,"name":userDetails.displayName,"email":userDetails.email}
            paymentDetails.razorpay_payment_id = response.razorpay_payment_id

            verifyPayment(
              tempUserDetails, plan, appointmentDetails,paymentDetails
            );
          },
          prefill: {
            name: userDetails.displayName,
            email: userDetails.email,
          },
          notes: {
            address:
              "9, II, Manasa Tower, PVS Junction, Kodailbail, Mangaluru, Karnataka 575003",
          },
          theme: {
            color: "#F37254",
          },
        };

        const rzp1 = new Razorpay(options);
        rzp1.on("payment.failed", function (response) {
          toast.error(`Payment Failed: ${response.error.description}`, {
            autoClose: 3000,
            draggable: true,
          });
        });
        rzp1.open();
      } else {
        toast.update(toastId, {
          render: data.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
          draggable: true,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Error processing payment.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        draggable: true,
      });
      console.error("Error processing payment:", error);
    }
  };


export {handlePayment, verifyPayment}
