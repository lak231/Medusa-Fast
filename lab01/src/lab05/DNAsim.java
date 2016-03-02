/* *****************************************
 * CSCI205 - Software Engineering and Design
 * Spring 2016
 *
 * Name: Tom Ficcadenti
 * Date: Feb 4, 2016
 * Time: 5:00:58 PM
 *
 * Project: csci205
 * Package: Lab05
 * File: DNAsim
 * Description:
 *
 * ****************************************
 */
package lab05;

import java.util.Random;
import java.util.Scanner;

/**
 * A class that simulates a DNA strand based on GC content
 *
 * @author tjf010
 */
public class DNAsim {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        int dnaLength;
        double pctGC;

        Scanner input = new Scanner(System.in);

        System.out.print(
                "Welcome to the DNA simulator. How long would you like your DNA strand to be? ");
        dnaLength = input.nextInt();

        System.out.print("\nWhat %GC-content? ");
        pctGC = input.nextDouble();

        char[] dnaSample = generateDNA(dnaLength, pctGC);

        printDNAStats(dnaSample);
        printLongestRepeat(dnaSample);

    }

    /**
     * A method that generates a simulated DNA strand of C's, G's, A's and T's
     *
     * @param length the length of the desired DNA sim
     * @param gcContentPct the % of GC content of the desired DNA sim
     *
     * @return An array of characters that represent a simulated DNA strand
     */
    public static char[] generateDNA(int length, double gcContentPct) {

        System.out.println("Generating...");

        Random RNG = new Random();

        char[] output = new char[length];

        for (int i = 0; i < length; i++) {

            if ((double) RNG.nextInt(100) < gcContentPct) {

                if (RNG.nextInt(2) == 0) {
                    output[i] = 'G';
                } else {
                    output[i] = 'C';
                }
            } else {

                if (RNG.nextInt(2) == 0) {
                    output[i] = 'A';
                } else {
                    output[i] = 'T';
                }
            }
        }

        System.out.println("Complete!");

        return output;
    }

    /**
     * A method that prints the stats of a DNA strand
     *
     * @param dna a sample dna strand to record stats from
     */
    public static void printDNAStats(char[] dna) {

        int numAdenine = 0;
        int numThymine = 0;
        int numGuanine = 0;
        int numCytosine = 0;

        for (int i = 0; i < dna.length; i++) {

            switch (dna[i]) {
                case 'G':
                    numGuanine += 1;
                    break;
                case 'C':
                    numCytosine += 1;
                    break;
                case 'A':
                    numAdenine += 1;
                    break;
                case 'T':
                    numThymine += 1;
                    break;
            }
        }

        System.out.println("Actual content of DNA sequence");
        System.out.printf("A: %d (%.1f%%)\n", numAdenine,
                          ((double) numAdenine / dna.length) * 100.0);
        System.out.printf("C: %d (%.1f%%)\n", numCytosine,
                          ((double) numCytosine / dna.length) * 100.0);
        System.out.printf("G: %d (%.1f%%)\n", numGuanine,
                          ((double) numGuanine / dna.length) * 100.0);
        System.out.printf("T: %d (%.1f%%)\n", numThymine,
                          ((double) numThymine / dna.length) * 100.0);
    }

    /**
     * A method that finds the longest sequence of repeated nucleotides and
     * prints them along with their location
     *
     * @param dna a sample dna strand to record stats from
     */
    public static void printLongestRepeat(char[] dna) {

        int repeat = 0;
        int maxRepeat = 0;
        int maxRepeatChar = dna[0];
        int MRCIndex = 0;
        char prevChar = dna[0];

        for (int i = 1; i < dna.length; i++) {
            if (prevChar == dna[i]) {
                repeat += 1;
            } else {
                if (repeat > maxRepeat) {
                    maxRepeat = repeat;
                    maxRepeatChar = prevChar;
                    MRCIndex = i;
                } else {
                    prevChar = dna[i];
                }

                repeat = 0;

            }
        }

        System.out.printf("Longest repeated nucleotide: %d %c's [index: %d]\n",
                          maxRepeat, maxRepeatChar, MRCIndex);
    }
}
