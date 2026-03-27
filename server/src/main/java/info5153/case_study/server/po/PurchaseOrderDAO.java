package info5153.case_study.server.po;

import java.time.LocalDateTime;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.EntityManager;

import info5153.case_study.server.product.Product;
import info5153.case_study.server.product.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;

@Component
public class PurchaseOrderDAO {
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public PurchaseOrder create(PurchaseOrder purchaseOrder) {
        purchaseOrder.setDate(LocalDateTime.now());
        entityManager.persist(purchaseOrder);

        for (PurchaseOrderLineItem item : purchaseOrder.getItems()) {
            item.setPoId(purchaseOrder.getID());
            entityManager.persist(item);

            String productId = item.getProductId();
            int orderedQty = item.getQuantity();

            Optional<Product> optionalProduct = productRepository.findById(productId);
            if (optionalProduct.isEmpty()) continue;

            Product product = optionalProduct.get();

            int qoh = product.getQoh();  
            int qoo = product.getQoo();  
            int rop = product.getRop();  
            int eoq = product.getEoq();  

            if (orderedQty < qoh) {
                qoh -= orderedQty;
            } else {
                qoh = 0; 
            }

            if (qoh <= rop) {
                qoo += eoq;
            }

            product.setQoh(qoh);
            product.setQoo(qoo);
            productRepository.save(product);
        }

        entityManager.flush();
        entityManager.refresh(purchaseOrder);
        return purchaseOrder;
    }
}
