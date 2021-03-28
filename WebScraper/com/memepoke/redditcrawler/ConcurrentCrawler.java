package com.memepoke.redditcrawler;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentCrawler implements Runnable {
  private static final Map<String, String> visitedPages = new ConcurrentHashMap<>();
  private static final Map<String, String> visitedMemes = new ConcurrentHashMap<>();
  private static final int MAX_DEPTH = 15;
  public final String startUrl;
  private String currentSubreddit;
  private Integer currentSubCount;

  ConcurrentCrawler(String URL, String sub) {
    this.startUrl = URL;
    this.currentSubreddit = sub;
  }

  public static void main(String[] args) throws InterruptedException, IOException {
    final List<String> subreddits =
        List.of(
            "memes",
            "prequelmemes",
            "animemes",
            "trebuchetmemes",
            "dankmemes",
            "terriblefacebookmemes",
            "sciencememes",
            "historymemes",
            "goodanimemes");
    ConcurrentCrawler crawler;
    for (String subreddit : subreddits) {
      crawler = new ConcurrentCrawler("https://www.reddit.com/r/" + subreddit, subreddit);
      crawler.currentSubreddit = subreddit;
      crawler.currentSubCount = 0;
      Thread thread1 = new Thread(crawler);
      thread1.start();
      thread1.join();
    }
    System.out.println(visitedPages);
    System.out.println(visitedMemes);
    BufferedWriter out =
        new BufferedWriter(new FileWriter("src/com/memepoke/redditcrawler/memezzzzLinks.txt"));
    for (Map.Entry<String, String> pair : visitedMemes.entrySet()) {
      out.write(pair.getKey());
      out.write(" ");
      out.write(pair.getValue());
      out.newLine();
    }
    out.close();
  }

  public void getPageLinks(String URL, Integer depth) {
    String toCrawl;
    if ((depth < MAX_DEPTH) && visitedPages.putIfAbsent(URL, currentSubreddit) == null) {
      try {
        System.out.println(URL);

        Document document = Jsoup.connect(URL).get();

        Elements linksOnPage = document.select("a[href]");

        depth++;

        for (Element page : linksOnPage) {
          toCrawl = page.attr("abs:href");
          if (toCrawl.contains(startUrl) && currentSubCount < 3000) {
            currentSubCount++;
            getPageLinks(toCrawl, depth);
          }
        }
      } catch (IOException e) {
        System.err.println("For '" + URL + "': " + e.getMessage());
      }
    }
  }

  public void getImageLinks() {
    String imageURL;
    for (Map.Entry<String, String> pair : visitedPages.entrySet()) {
      try {
        Document document = Jsoup.connect(pair.getKey()).get();

        Elements imagesOnPage = document.getElementsByTag("img");

        for (Element image : imagesOnPage) {
          imageURL = image.attr("src");
          if (imageURL.contains("https://i.redd.it/")
              && visitedMemes.putIfAbsent(imageURL, currentSubreddit) == null) {
            System.out.println(imageURL);
          }
        }
      } catch (IOException e) {
        System.err.println("For '" + pair.getKey() + "': " + e.getMessage());
      }
    }
  }

  @Override
  public void run() {
    getPageLinks(startUrl, 0);
    System.out.println(visitedPages);
    System.out.println(visitedPages.size());
    getImageLinks();
  }
}
