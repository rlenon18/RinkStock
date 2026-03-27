package info5153.case_study.server.po;

import info5153.case_study.server.vendor.VendorRepository;
import info5153.case_study.server.product.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.ByteArrayInputStream;

@CrossOrigin
@RestController
public class PurchaseOrderController {
    
    @Autowired
    private PurchaseOrderDAO poDAO;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseOrderRepository poRepository;

    @PostMapping("/api/po")
    public ResponseEntity<PurchaseOrder> addOne(@RequestBody PurchaseOrder purchaseOrder) {
         return new ResponseEntity<PurchaseOrder>(poDAO.create(purchaseOrder), HttpStatus.OK);
    }
    
    @GetMapping("/api/po/{id}")
    public ResponseEntity<Iterable<PurchaseOrder>> findByVendor(@PathVariable Long id) {
    return new ResponseEntity<Iterable<PurchaseOrder>>(poRepository.findByVendorId(id), HttpStatus.OK);
    }

    @GetMapping(value = "/api/po/pdf/{id}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> reportPDF(@PathVariable Long id) {

        ByteArrayInputStream bis = PDFGenerator.generateReport(id.toString(), vendorRepository,
                productRepository, poRepository);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=report_" + id.toString() + ".pdf");

        return ResponseEntity.ok().headers(headers).contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
