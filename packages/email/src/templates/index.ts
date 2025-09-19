export function offerReceivedTemplate(data: {
  recipientName: string;
  buyerOrgName: string;
  listingTitle: string;
  price: number;
  quantity: string;
  unit: string;
  appUrl: string;
  offerId: string;
}) {
  return {
    subject: `New offer received for "${data.listingTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>New Offer Received</h1>
        <p>Hello ${data.recipientName},</p>
        <p>You have received a new offer for your listing <strong>"${data.listingTitle}"</strong>.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Offer Details</h3>
          <p><strong>From:</strong> ${data.buyerOrgName}</p>
          <p><strong>Price:</strong> $${data.price}/${data.unit}</p>
          <p><strong>Quantity:</strong> ${data.quantity} ${data.unit}</p>
        </div>
        
        <p>
          <a href="${data.appUrl}/offers/${data.offerId}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Offer
          </a>
        </p>
        
        <p>Best regards,<br>The VeilMarket Team</p>
      </div>
    `,
    text: `
New Offer Received

Hello ${data.recipientName},

You have received a new offer for your listing "${data.listingTitle}".

Offer Details:
- From: ${data.buyerOrgName}
- Price: $${data.price}/${data.unit}
- Quantity: ${data.quantity} ${data.unit}

View the offer: ${data.appUrl}/offers/${data.offerId}

Best regards,
The VeilMarket Team
    `.trim(),
  };
}

export function offerAcceptedTemplate(data: {
  recipientName: string;
  sellerOrgName: string;
  listingTitle: string;
  price: number;
  quantity: string;
  unit: string;
  appUrl: string;
  threadId: string;
}) {
  return {
    subject: `Your offer has been accepted for "${data.listingTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Offer Accepted! 🎉</h1>
        <p>Hello ${data.recipientName},</p>
        <p>Great news! Your offer for <strong>"${data.listingTitle}"</strong> has been accepted.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3>Accepted Offer</h3>
          <p><strong>Seller:</strong> ${data.sellerOrgName}</p>
          <p><strong>Price:</strong> $${data.price}/${data.unit}</p>
          <p><strong>Quantity:</strong> ${data.quantity} ${data.unit}</p>
        </div>
        
        <p>The seller's company details have now been revealed. You can proceed with the transaction through our platform.</p>
        
        <p>
          <a href="${data.appUrl}/threads/${data.threadId}" 
             style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Details
          </a>
        </p>
        
        <p>Best regards,<br>The VeilMarket Team</p>
      </div>
    `,
    text: `
Offer Accepted!

Hello ${data.recipientName},

Great news! Your offer for "${data.listingTitle}" has been accepted.

Accepted Offer:
- Seller: ${data.sellerOrgName}
- Price: $${data.price}/${data.unit}
- Quantity: ${data.quantity} ${data.unit}

The seller's company details have now been revealed. You can proceed with the transaction through our platform.

View details: ${data.appUrl}/threads/${data.threadId}

Best regards,
The VeilMarket Team
    `.trim(),
  };
}