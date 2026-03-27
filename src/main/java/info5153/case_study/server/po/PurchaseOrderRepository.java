package info5153.case_study.server.po;
import java.util.List;
import org.springframework.data.repository.CrudRepository;

public interface PurchaseOrderRepository extends CrudRepository<PurchaseOrder, Long> {
    List <PurchaseOrder> findByVendorId(Long id);
    
}
