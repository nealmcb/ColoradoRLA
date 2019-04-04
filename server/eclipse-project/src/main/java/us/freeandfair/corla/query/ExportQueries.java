package us.freeandfair.corla.query;

import java.io.OutputStream;
import java.io.File;
import java.net.URL;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import java.util.Map;
import java.util.HashMap;
import java.util.stream.Stream;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import org.postgresql.copy.CopyManager;
import org.postgresql.core.BaseConnection;

import org.hibernate.Session;
import org.hibernate.jdbc.Work;
import java.sql.Connection;
import org.hibernate.query.Query;

import us.freeandfair.corla.persistence.Persistence;

/** export queries **/
public class ExportQueries {

  /**
   * Class-wide logger
   */
  public static final Logger LOGGER =
    LogManager.getLogger(ExportQueries.class);


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


  /**
   * write the resulting rows from the query, as json objects, to the OutputStream
   **/
  public static void jsonOut(final String query, final OutputStream os){
    final Session s = Persistence.currentSession();
    final String withoutSemi = query.replace(";", "");
    final String jsonQuery = String.format("SELECT cast(row_to_json(r) as text)"
                                           + " FROM (%s) r",
                                           withoutSemi);
    final Query q = s.createNativeQuery(jsonQuery)
      .setReadOnly(true)
      .setFetchSize(1000);

    // interleave an object separator (the comma and line break) into the stream
    // of json objects to create valid json thx! https://stackoverflow.com/a/25624818
    final Stream<Object[]> results = q.stream()
      .flatMap(i -> Stream.of(new String[]{",\n"}, i))
      .skip(1); //remove the first separator

    // write json by hand to preserve streaming writes in case of big data
    try {
    os.write("[".getBytes(StandardCharsets.UTF_8));
    results.forEach(line -> {
        try {
          // the object array is the columns, but in this case there is only
          // one, so we take it at index 0
          os.write(line[0].toString().getBytes(StandardCharsets.UTF_8));
        } catch (java.io.IOException e) {
          LOGGER.error(e.getMessage());
        }
      });

    os.write("]".getBytes(StandardCharsets.UTF_8));
    } catch (java.io.IOException e) {
      //log it
      LOGGER.error(e.getMessage());
    }
  }

  /** send query results to output stream as csv **/
  public static void csvOut(final String query, final OutputStream os) {
    final Session s = Persistence.currentSession();
    final String withoutSemi = query.replace(";", "");
    s.doWork(new CSVWork(withoutSemi,os));
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
