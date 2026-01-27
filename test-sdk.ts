import {
  CrowdsplitSDK,
  CustomerListQueryParams,
  SubmitProviderRegistrationRequest,
} from "./src";
import dotenv from "dotenv";
dotenv.config();

async function testSDK() {
  console.log(process.env.BASE_URL);
  // Initialize the SDK with your backend's configuration
  const sdk = new CrowdsplitSDK({
    baseUrl: process.env.BASE_URL as string, // Replace with your actual API base URL
    clientId: process.env.CLIENT_ID as string, // Replace with your actual client ID
    clientSecret: process.env.CLIENT_SECRET as string, // Replace with your actual client secret
  });

  // try {
  //   const params: CustomerListQueryParams = {
  //     limit: 10,
  //     offset: 0,
  //   };
  //   const response = await sdk.customer.listCustomers(params);
  //   console.log("Customer List Response:", response);
  // } catch (error) {
  //   console.error("Error:", error);
  // }

  // try {
  //   const provider = "mercado_pago";
  //   const response = await sdk.provider.getProviderSchema(provider);
  //   console.log("Provider Schema Response:", response);
  // } catch (error) {
  //   console.error("Error:", error);
  // }

  // try {
  //   const customerId = "3ccf61b1-d884-4b9a-8a1c-3c4f29fcd0a1";
  //   const response = await sdk.provider.getProviderRegistrationStatus(
  //     customerId
  //   );
  //   console.log("Provider Registration Status Response:", response);
  // } catch (error) {
  //   console.error("Error:", error);
  // }

  // try {
  //   const customerId = "3ccf61b1-d884-4b9a-8a1c-3c4f29fcd0a1";
  //   const registration: ProviderRegistrationRequest = {
  //     provider: "pagar_me",
  //     target_role: "customer",
  //   };
  //   const response = await sdk.provider.submitProviderRegistration(
  //     customerId,
  //     registration
  //   );
  //   console.log("Provider Registration Response:", response);
  // } catch (error) {
  //   console.error("Error:", error);
  // }

  // try {
  //   const confirmation = await sdk.payment.confirmPayment(
  //     "eb4ebcd4-e9c1-44f6-94c8-c55117bb6abb"
  //   );
  //   console.log("Payment confirmed:", confirmation.data.status);
  // } catch (err) {
  //   console.error("Error confirming payment:", err);
  // }

  // try {
  //   const confirmation = await sdk.payment.addCustomerPaymentMethod(
  //     "1c1fd15c-2545-4762-9af9-27a0246520ba",
  //     {
  //       type: "bank",
  //       bank_name: "JP Morgan",
  //       bank_account_name: "21235",
  //       bank_account_number: "62650521015",
  //       bank_branch_code: "52",
  //       bank_swift_code: "4562", // ispb
  //       bank_account_type: "payment", // payment/ checking/ savings
  //     }
  //   );
  //   console.log("Payment confirmed:", confirmation.data.status);
  // } catch (err) {
  //   console.error("Error confirming payment:", err);
  // }

  // try {
  //   const confirmation = await sdk.payment.getCustomerPaymentMethod(
  //     "1c1fd15c-2545-4762-9af9-27a0246520ba",
  //     "398e54c4-5c34-46f9-8a66-d489c901288f"
  //   );
  //   console.log("Payment :", confirmation.data);
  // } catch (err) {
  //   console.error("Error getting payment:", err);
  // }

  // try {
  //   const confirmation = await sdk.payment.deleteCustomerPaymentMethod(
  //     "1c1fd15c-2545-4762-9af9-27a0246520ba",
  //     "a9d6f9f8-76d7-48c5-85b7-d265504b4bdb"
  //   );
  //   console.log("Payment method :", confirmation);
  // } catch (err) {
  //   console.error("Error deleting payment:", err);
  // }

  // try {
  //   const confirmation = await sdk.payment.getAllCustomerPaymentMethods(
  //     "1c1fd15c-2545-4762-9af9-27a0246520ba",
  //     {
  //       type: "card,pix,customer_wallet",
  //     }
  //   );
  //   console.log("Payment method :", confirmation.data);
  // } catch (err) {
  //   console.error("Error getting payment:", err);
  // }

  // try {
  //   const confirmation = await sdk.payment.deleteCustomerPaymentMethod(
  //     "1c1fd15c-2545-4762-9af9-27a0246520ba",
  //     "a9d6f9f8-76d7-48c5-85b7-d265504b4bdb"
  //   );
  //   console.log("Payment method :", confirmation);
  // } catch (err) {
  //   console.error("Error deleting payment:", err);
  // }

  // try {
  //   const response = await sdk.transaction.getAllTransactions({
  //     type_list: "refund,installment_payment",
  //   });
  //   console.log("Payment method :", response);
  // } catch (err) {
  //   console.error("Error deleting payment:", err);
  // }

  // try {
  //   const response = await sdk.transaction.getTransaction(
  //     "418b7de3-093b-4eaf-bd61-7cd77d104410"
  //   );
  //   console.log("Transaction found :", response);
  // } catch (err) {
  //   console.error("Error getting transaction:", err);
  // }

  // try {
  //   const response = await sdk.webhookService.getAllWebhooks();
  //   console.log("Webhook found :", response);
  // } catch (err) {
  //   console.error("Error getting Webhook:", err);
  // }

  // try {
  //   const response = await sdk.webhookService.registerWebhook({
  //     url: "localhost:3000/ping2",
  //     description: "testing sdk",
  //   });
  //   console.log("Webhook found :", response);
  // } catch (err) {
  //   console.error("Error getting Webhook:", err);
  // }

  // try {
  //   const response = await sdk.webhookService.deleteWebhook(
  //     "40adc88a-c19f-4c2a-bf6e-8e967e675ebf"
  //   );
  //   console.log("Webhook found :", response);
  // } catch (error) {
  //   console.error("Error getting Webhook:", error);
  // }

  // try {
  //   const response = await sdk.webhookService.getAllWebhooks();
  //   console.log("Webhook found :", response);
  // } catch (err) {
  //   console.error("Error getting Webhook:", err);
  // }

  // try {
  //   const response = await sdk.webhookService.getWebhookNotifications(
  //     "92cac70a-ef19-4998-b141-4614c4f650db"
  //   );
  //   console.log("Webhook found :", response);
  // } catch (err) {
  //   console.error("Error getting Webhook:", err);
  // }

  // try {
  //   const reqBody = {
  //     provider: "stripe" as const,
  //     source: {
  //       amount: 2500,
  //       currency: "usd" as const,
  //       customer: {
  //         id: "1c1fd15c-2545-4762-9af9-27a0246520ba",
  //       }, // optional
  //     },
  //     destination: {
  //       customer: {
  //         id: "1c1fd15c-2545-4762-9af9-27a0246520ba",
  //       },
  //       payment_method: {
  //         type: "bank" as const,
  //         id: "dfe076fc-b47e-4ccd-be46-7301694bbbf5",
  //       },
  //     }, // required
  //     metadata: {
  //       reference_id: "payout_20250717_abc123",
  //       campaign_id: "crowdfund_xyz",
  //     },
  //   };
  //   const response = await sdk.transfer.createTransfer(reqBody);
  //   console.log("transfer successful :", response);
  // } catch (err) {
  //   console.error("Error creating transfer:", err);
  // }

  // const req = {
  //   provider: "avenia" as const,
  //   source: {
  //     customer: {
  //       id: "fd1bcf8a-8f2a-493d-b3d3-e575c506cb73",
  //     }, // if not provided, the master account would be assumed as source
  //     currency: "brla",
  //     amount: 100,
  //   },
  //   destination: {
  //     customer: {
  //       id: "b776bbfb-69cd-42df-bb64-06d46c79db6d",
  //     },
  //     currency: "brl",
  //     payment_method: {
  //       type: "pix" as const,
  //       id: "e82ed5e1-c828-41c1-9b43-a391bf5e33f2",
  //     },
  //   },
  // };

  // try {
  //   const response = await sdk.sell.createSell(req);
  //   console.log("Webhook found :", response);
  // } catch (err) {
  //   console.error("Error getting Webhook:", err);
  // }

  try {
    const response = await sdk.transaction.getAllTransactions();
    console.log("Webhook found :", response);
  } catch (err) {
    console.error("Error getting Webhook:", err);
  }
}

testSDK();
