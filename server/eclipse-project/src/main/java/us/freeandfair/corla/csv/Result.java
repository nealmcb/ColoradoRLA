package us.freeandfair.corla.csv;

/** The result of parsing/importing a csv file **/
public class Result {
  public boolean success;
  public Integer importedCount;
  public String errorMessage;
  public Integer errorRowNum;
  public String errorRowContent;
}
