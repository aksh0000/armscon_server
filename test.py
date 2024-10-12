import qrcode

# UPI URL format
upi_link = "upi://pay?pa=ruthlessdestroyer085-1@okhdfcbank&pn=Ruthless Destroyer&am=500&cu=INR"

# Generate QR code
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)
qr.add_data(upi_link)
qr.make(fit=True)

# Create an image from the QR Code instance
img = qr.make_image(fill='black', back_color='white')

# Save the image to a file
img.save("upi_qr_code.png")

print("UPI QR Code generated and saved as upi_qr_code.png")
