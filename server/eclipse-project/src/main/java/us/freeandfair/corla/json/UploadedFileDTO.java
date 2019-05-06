package us.freeandfair.corla.json;


import us.freeandfair.corla.model.UploadedFile;
import us.freeandfair.corla.csv.DominionCVRExportParser;
import us.freeandfair.corla.csv.Result;

public class UploadedFileDTO {
  private Long fileId;
  private String timestamp;
  private Long countyId;
  private String fileName; // todo choose one
  private String name; // todo choose one
  private String status;
  private String errorMessage;
  private Result result;
  private String hash;
  private Long size;
  private Integer approximate_record_count;

  public UploadedFileDTO(final UploadedFile uploadedFile) {
    this.fileId = uploadedFile.id();
    this.timestamp = uploadedFile.timestamp().toString();
    this.countyId = uploadedFile.county().id();
    this.fileName = uploadedFile.filename();
    this.name = uploadedFile.filename();
    this.status = uploadedFile.getStatus().toString();
    this.errorMessage = uploadedFile.getErrorMessage();
    this.result = uploadedFile.getResult();
    this.hash = uploadedFile.getHash();
    this.size = uploadedFile.size();
    this.approximate_record_count = uploadedFile.approximateRecordCount();
  }
}
