package us.freeandfair.corla.query;

import java.io.OutputStream;
import java.io.File;
import java.net.URL;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.postgresql.copy.CopyManager;
import org.postgresql.core.BaseConnection;

import org.hibernate.Session;
import org.hibernate.jdbc.Work;
import java.sql.Connection;
import org.hibernate.query.Query;

import us.freeandfair.corla.persistence.Persistence;

/** export queries **/
public class ExportQueries {

  /** to use the hibernate jdbc connection  **/
  public static class CSVWork implements Work {

    /** pg query string **/
    private final String query;

    /** where to send the csv data **/
    private final OutputStream os;

    /** instantiation **/
    public CSVWork(final String query,
                   final OutputStream os) {

      this.query = query;
      this.os = os;
    }

    /** do the work **/
    @SuppressWarnings("PMD.PreserveStackTrace")
    public void execute(final Connection conn)
      throws java.sql.SQLException {
      try {
        final CopyManager cm = new CopyManager(conn.unwrap(BaseConnection.class));
        final String q = String.format("COPY (%s) TO STDOUT WITH CSV HEADER", this.query);
        cm.copyOut(q, this.os);
      } catch (java.io.IOException e) {
        throw new java.sql.SQLException(e.getMessage());
      }
    }
  }

  /** no instantiation **/
  private ExportQueries(){};

  /** list each row as a string which is a json object **/
  public static List<String> jsonRows(final String query){
    final Session s = Persistence.currentSession();
    final String jsonQuery = String.format("SELECT cast(row_to_json(r) as varchar(256))"
                                           + " FROM (%s) r",
                                           query);
    final Query q = s.createNativeQuery(jsonQuery);
    return q.list();
  }

  /** send query results to output stream as csv **/
  public static void csvOut(final String query, final OutputStream os) {
    final Session s = Persistence.currentSession();
    s.doWork(new CSVWork(query,os));
  }

  /** ls a directory on the classpath **/
  private static File[] getResourceFolderFiles (final String folder) {
    final ClassLoader loader = Thread.currentThread().getContextClassLoader();
    final URL url = loader.getResource(folder);
    final String path = url.getPath();
    return new File(path).listFiles();
  }

  /** remove path and ext leaving the file name **/
  private static String fileName(final String path) {
    final int slash = path.lastIndexOf('/') + 1;
    final int dot = path.lastIndexOf('.');
    return path.substring(slash,dot);
  }


  /** file contents to string **/
  private static String fileContents(final String path)
  throws java.io.IOException {
    final StringBuilder contents = new StringBuilder();
    Files.lines(Paths.get(path), StandardCharsets.UTF_8)
      .forEach(line -> contents.append(line + "\n"));
    return contents.toString();
  }

  /**
   * read files from resources/sql/ and return map with keys as file names
   * without extension and value as the file contents
   **/
  public static Map<String,String> sqlFiles()
    throws java.io.IOException {
    final Map files = new HashMap<String,String>();
    for (final File file : getResourceFolderFiles("sql/")) {
      if(file.getPath().endsWith(".sql")) {
        files.put(fileName(file.getPath()),
                  fileContents(file.getPath()));
      }
    }
    return files;
  }

}
