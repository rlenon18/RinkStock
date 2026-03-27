package info5153.case_study.server.po;

import info5153.case_study.server.vendor.Vendor;
import info5153.case_study.server.vendor.VendorRepository;
import info5153.case_study.server.product.Product;
import info5153.case_study.server.product.ProductRepository;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Optional;
import java.time.format.DateTimeFormatter;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.HorizontalAlignment;

import com.itextpdf.io.exceptions.IOException;

import org.springframework.web.servlet.view.document.AbstractPdfView;

import info5153.case_study.server.qr.QRCodeGenerator;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.properties.HorizontalAlignment;

import java.net.URL;

public abstract class PDFGenerator extends AbstractPdfView {

    public static ByteArrayInputStream generateReport(
            String id,
            VendorRepository vendorRepository,
            ProductRepository productRepository,
            PurchaseOrderRepository poRepository) throws IOException {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            Locale locale = Locale.US;
            NumberFormat fmt = NumberFormat.getCurrencyInstance(locale);
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            // App Logo
            URL imageUrl = PDFGenerator.class.getResource("/static/images/Logo.png");
            Image img = new Image(ImageDataFactory.create(imageUrl)).setMaxHeight(64).setHorizontalAlignment(HorizontalAlignment.CENTER);
            document.add(img);

            // --- PO ID centered
            document.add(new Paragraph("PO #" + id)
                    .setFont(boldFont)
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER));

            // --- Retrieve PO
            Optional<PurchaseOrder> optPO = poRepository.findById(Long.parseLong(id));
            if (!optPO.isPresent()) {
                document.add(new Paragraph("Purchase Order not found").setFont(font));
                document.close();
                return new ByteArrayInputStream(baos.toByteArray());
            }

            PurchaseOrder po = optPO.get();

            // --- Vendor info
            String vendorInfo = "Unknown Vendor";
            Optional<Vendor> optVendor = vendorRepository.findById(po.getVendorId());
            if (optVendor.isPresent()) {
                Vendor vendor = optVendor.get();
                vendorInfo = vendor.getName() + " " + vendor.getAddress() + " (" + vendor.getEmail() + ")";
                document.add(new Paragraph("Vendor: " + vendorInfo)
                        .setFont(boldFont)
                        .setFontSize(12)
                        .setTextAlignment(TextAlignment.CENTER));
            }

            document.add(new Paragraph("\n"));

            // --- Table
            Table table = new Table(5).setWidth(new UnitValue(UnitValue.PERCENT, 100));
            table.addCell(headerCell("ID", boldFont));
            table.addCell(headerCell("Name", boldFont));
            table.addCell(headerCell("#", boldFont));
            table.addCell(headerCell("Price Per Unit", boldFont));
            table.addCell(headerCell("Units Total Price", boldFont));

            BigDecimal subtotal = BigDecimal.ZERO;

            // --- Table rows
            for (PurchaseOrderLineItem item : po.getItems()) {
                Optional<Product> optProduct = productRepository.findById(item.getProductId());
                if (optProduct.isEmpty()) continue;

                Product product = optProduct.get();
                BigDecimal qty = new BigDecimal(item.getQuantity());
                BigDecimal lineTotal = product.getCost().multiply(qty);
                subtotal = subtotal.add(lineTotal);

                table.addCell(bodyCell("" + product.getID(), font));
                table.addCell(bodyCell(product.getName(), font));
                table.addCell(bodyCell("" + item.getQuantity(), font));
                table.addCell(bodyCell(fmt.format(product.getCost()), font));
                table.addCell(bodyCell(fmt.format(lineTotal), font));
            }

            // --- Totals
            table.addCell(totalLabel("SubTotal:", boldFont, 4));
            table.addCell(totalValue(fmt.format(subtotal), boldFont));

            BigDecimal tax = subtotal.multiply(new BigDecimal("0.13"), new MathContext(8, RoundingMode.HALF_UP));
            table.addCell(totalLabel("Tax (13%):", boldFont, 4));
            table.addCell(totalValue(fmt.format(tax), boldFont));

            BigDecimal grandTotal = subtotal.add(tax);
            table.addCell(totalLabel("Grand Total:", boldFont, 4));
            table.addCell(totalValue(fmt.format(grandTotal), boldFont));

            document.add(table);

            // --- PO date
            String poDate = dateTimeFormatter.format(po.getDate());
            document.add(new Paragraph("\n" + poDate).setTextAlignment(TextAlignment.CENTER));

            // --- QR code summary
            String summary = "Product Order Id #" + id + "\n";
            summary += vendorInfo + "\n";
            summary += "Grand Total: " + fmt.format(grandTotal) + "\n";
            summary += "Date: " + poDate;

            Image qrCode = new Image(ImageDataFactory.create(QRCodeGenerator.generateQRCode(summary)))
                    .scaleAbsolute(128, 128)
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);
            document.add(qrCode);

            document.close();

        } catch (Exception ex) {
            Logger.getLogger(PDFGenerator.class.getName()).log(Level.SEVERE, null, ex);
        }

        return new ByteArrayInputStream(baos.toByteArray());
    }

    // --- Helper methods
    private static Cell headerCell(String text, PdfFont font) {
        return new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(12))
                .setTextAlignment(TextAlignment.CENTER);
    }

    private static Cell bodyCell(String text, PdfFont font) {
        return new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(11))
                .setTextAlignment(TextAlignment.CENTER);
    }

    private static Cell totalLabel(String text, PdfFont font, int colspan) {
        return new Cell(1, colspan)
                .add(new Paragraph(text).setFont(font).setFontSize(12))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null);
    }

    private static Cell totalValue(String text, PdfFont font) {
        return new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(12))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null);
    }
}
