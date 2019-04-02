package us.freeandfair.corla.query;

import java.io.OutputStream;
import java.io.File;
import java.net.URL;
// import java.io.Resource;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Stream;


import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.postgresql.copy.CopyManager;
import org.postgresql.PGConnection;
import org.postgresql.core.BaseConnection;

import org.hibernate.Session;
import org.hibernate.jdbc.Work;
import java.sql.Connection;
import org.hibernate.query.Query;

import us.freeandfair.corla.persistence.Persistence;

public class ExportQueries {

  public static class CSVWork implements Work {

    private String query;
    private OutputStream os;

    public CSVWork(final String query,
                   final OutputStream os) {

      this.query = query;
      this.os = os;
    }

    public void execute(Connection conn)
      throws java.sql.SQLException {
      try {
        CopyManager cm = new CopyManager(conn.unwrap(BaseConnection.class));
        String q = String.format("COPY (%s) TO STDOUT WITH CSV HEADER", this.query);
        cm.copyOut(q, this.os);
      } catch (java.io.IOException e) {
        throw new java.sql.SQLException(e.getMessage());
      }
    }
  }

  /** no instantiation **/
  private ExportQueries(){};

  public static List<String> jsonRows(final String query){
    final Session s = Persistence.currentSession();
    final String jsonQuery = String.format("SELECT cast(row_to_json(r) as varchar(256))"
                                           + " FROM (%s) r",
                                           query);
    Query q = s.createNativeQuery(jsonQuery);
    return q.list();
  }

  public static void csvOut(final String query, final OutputStream os) {
    final Session s = Persistence.currentSession();
    s.doWork(new CSVWork(query,os));
  }

  private static File[] getResourceFolderFiles (String folder) {
    ClassLoader loader = Thread.currentThread().getContextClassLoader();
    URL url = loader.getResource(folder);
    String path = url.getPath();
    return new File(path).listFiles();
  }

  private static String fileName(final String path) {
    final int slash = path.lastIndexOf("/") + 1;
    final int dot = path.lastIndexOf(".");
    return path.substring(slash,dot);
  }


  private static String fileContents(final String path)
  throws java.io.IOException {
    StringBuilder contents = new StringBuilder();
    Files.lines(Paths.get(path), StandardCharsets.UTF_8)
      .forEach(line -> contents.append(line + "\n"));
    return contents.toString();
  }

  public static Map<String,String> sqlFiles()
    throws java.io.IOException {
    final Map files = new HashMap<String,String>();
    for (File file : getResourceFolderFiles("sql/")) {
      if(file.getPath().endsWith(".sql")) {
        files.put(fileName(file.getPath()),
                  fileContents(file.getPath()));
      }
    }
    return files;
  }

}
