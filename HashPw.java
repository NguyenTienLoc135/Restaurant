public class HashPw {
  public static void main(String[] args) {
    var encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    for (String arg : args) {
      System.out.println(arg + ":" + encoder.encode(arg));
    }
  }
}
