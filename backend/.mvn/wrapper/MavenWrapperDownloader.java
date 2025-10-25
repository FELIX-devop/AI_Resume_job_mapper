package org.apache.maven.wrapper;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Downloads the Maven wrapper JAR if needed.
 */
public class MavenWrapperDownloader {

    private static final String WRAPPER_VERSION = "3.1.0";
    private static final String MAVEN_USER_HOME = System.getProperty("user.home");
    private static final String MAVEN_WRAPPER_DIR = MAVEN_USER_HOME + "/.m2/wrapper";
    private static final String MAVEN_WRAPPER_PROPERTIES_FILE = ".mvn/wrapper/maven-wrapper.properties";
    private static final String MAVEN_WRAPPER_JAR = ".mvn/wrapper/maven-wrapper.jar";
    private static final String PROPERTY_NAME_WRAPPER_URL = "wrapperUrl";

    public static void main(String args[]) {
        System.out.println("- Downloading from: " + args[0]);
        System.out.println("- Downloading to: " + args[1]);
        try {
            downloadFileFromURL(args[0], args[1]);
            System.out.println("Done");
            System.out.println("");
        } catch (IOException e) {
            System.err.println("- Error downloading: " + e.getMessage());
            System.exit(1);
        }
    }

    static void downloadFileFromURL(String urlString, String destination) throws IOException {
        URL website = new URL(urlString);
        try (InputStream in = website.openStream()) {
            Path target = Paths.get(destination);
            Files.createDirectories(target.getParent());
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

}
