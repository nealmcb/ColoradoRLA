package us.freeandfair.corla.query;

import java.io.OutputStream;

import java.util.List;
import java.util.Map;
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
}
