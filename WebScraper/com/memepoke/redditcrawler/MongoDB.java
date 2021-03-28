package com.memepoke.redditcrawler;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.*;
import org.bson.Document;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.*;

public class MongoDB {
  static MongoClient client =
      new MongoClient(new MongoClientURI("mongodb+srv://user1:hello123@cluster0.ziuz5.mongodb.net/lol1?retryWrites=true&w=majority"));
  // static MongoClient clientz = MongoClients.create("mongodb+srv://cluster0.ziuz5.mongodb.net/lol1");
  static MongoDatabase database = client.getDatabase("lol1");
  static MongoCollection<Document> reddit = database.getCollection("memes");

//    public static void main(String[] args) {
//      FindIterable<Document> iterDoc = reddit.find();
//      Iterator it = iterDoc.iterator();
//      System.out.println(it.next());
//    }

  public static void main(String[] args) {
      Map<String, String> memeUrls = new HashMap<>();
      try {
        File input = new File("com/memepoke/redditcrawler/memezzzzLinks.txt");
        Scanner scanner = new Scanner(input);
        String data;
        List<String> pair;
        do {
          data = scanner.nextLine();
          pair = Arrays.asList(data.split(" "));
          memeUrls.put(pair.get(0), pair.get(1));
        } while (scanner.hasNext());
        scanner.close();
      } catch (FileNotFoundException e) {
        System.out.println(
            "File not found! Please make sure the path is correct and try " + "again!");
      }

      Document document;
      List<Document> documents = new ArrayList<>();
      FindIterable<Document> iterDoc = reddit.find();

      for (Map.Entry<String, String> pair : memeUrls.entrySet()) {
        document = new Document();
        document.put("memeId", pair.getKey());
        document.put("subreddit", pair.getValue());
        document.put("imageURL", pair.getKey());

//        documents.add(document);
        boolean contains = false;
        Iterator it = iterDoc.iterator();
        while (it.hasNext()) {
          if (it.next() == document) {
            contains = true;
          }
        }
        if (!contains) {
          documents.add(document);
        }
      }

    System.out.println(documents.toString());

      reddit.insertMany(documents);
    }
}
